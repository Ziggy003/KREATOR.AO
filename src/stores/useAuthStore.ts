import { create } from "zustand";
import { User as AppUser, CreatorProfile, BrandProfile } from "../types";
import { auth, db, signInWithGoogle, signInWithFacebook, loginWithEmail, signupWithEmail, logout as firebaseLogout, handleFirestoreError, OperationType } from "../lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";

interface AuthState {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  creatorProfile: CreatorProfile | null;
  brandProfile: BrandProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => void;
  login: (type?: AppUser["type"]) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, type: AppUser["type"]) => Promise<void>;
  logout: () => Promise<void>;
  handleUserSetup: (user: FirebaseUser, type?: AppUser["type"]) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  appUser: null,
  creatorProfile: null,
  brandProfile: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    let userUnsubscribe: (() => void) | null = null;
    let profileUnsubscribe: (() => void) | null = null;

    onAuthStateChanged(auth, (user) => {
      // Cleanup previous listeners
      if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = null;
      }
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      set({ 
        user, 
        isAuthenticated: !!user, 
        isLoading: false 
      });

      if (user) {
        // Listen to user document
        const userDocRef = doc(db, "users", user.uid);
        userUnsubscribe = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data() as AppUser;
            set({ appUser: userData });
            
            // Listen to profile based on type
            if (profileUnsubscribe) profileUnsubscribe();
            
            if (userData.type === "creator") {
              profileUnsubscribe = onSnapshot(doc(db, "creator_profiles", user.uid), (profileSnap) => {
                set({ creatorProfile: profileSnap.exists() ? profileSnap.data() as CreatorProfile : null });
              });
            } else if (userData.type === "brand") {
              profileUnsubscribe = onSnapshot(doc(db, "brand_profiles", user.uid), (profileSnap) => {
                set({ brandProfile: profileSnap.exists() ? profileSnap.data() as BrandProfile : null });
              });
            }
          }
        }, (error) => {
          // Only log if user is still authenticated to avoid noise during logout
          if (auth.currentUser) {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          }
        });
      } else {
        set({ appUser: null, creatorProfile: null, brandProfile: null });
      }
    });
  },

  login: async (type?: AppUser["type"]) => {
    set({ isLoading: true });
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      await get().handleUserSetup(user, type);
      toast.success("Login efectuado com sucesso!");
    } catch (error: any) {
      if (error.code === "auth/operation-not-allowed") {
        toast.error("O login com Google não está activado no Firebase Console.");
      } else {
        toast.error("Erro ao entrar com Google.");
      }
      handleFirestoreError(error, OperationType.WRITE, "auth/login");
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithEmail: async (email: string, pass: string) => {
    set({ isLoading: true });
    try {
      await loginWithEmail(email, pass);
      toast.success("Login efectuado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao entrar. Verifique as suas credenciais.");
      handleFirestoreError(error, OperationType.WRITE, "auth/login-email");
    } finally {
      set({ isLoading: false });
    }
  },

  signupWithEmail: async (email: string, pass: string, type: AppUser["type"]) => {
    set({ isLoading: true });
    try {
      const result = await signupWithEmail(email, pass);
      const user = result.user;
      await get().handleUserSetup(user, type);
      toast.success("Conta criada com sucesso!");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Este email já está em uso.");
      } else {
        toast.error("Erro ao criar conta.");
      }
      handleFirestoreError(error, OperationType.WRITE, "auth/signup-email");
    } finally {
      set({ isLoading: false });
    }
  },

  handleUserSetup: async (user: FirebaseUser, type?: AppUser["type"]) => {
    // Check if user document exists, if not create a default one
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const selectedType = type || "creator";
      const userData: AppUser = {
        uid: user.uid,
        email: user.email || "",
        type: selectedType,
        kycStatus: "none",
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, userData);
      
      // Create profile based on type
      if (selectedType === "creator") {
        await setDoc(doc(db, "creator_profiles", user.uid), {
          uid: user.uid,
          name: user.displayName || "Novo Criador",
          updatedAt: new Date().toISOString(),
          stats: { followers: 0, views: 0, likes: 0 },
          balance: { aoa: 0, usd: 0 },
          plan: "free"
        });
      } else if (selectedType === "brand") {
        await setDoc(doc(db, "brand_profiles", user.uid), {
          uid: user.uid,
          companyName: user.displayName || "Nova Marca",
          updatedAt: new Date().toISOString(),
          balance: { aoa: 0, usd: 0 }
        });
      }
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await firebaseLogout();
      set({ user: null, appUser: null, creatorProfile: null, brandProfile: null, isAuthenticated: false });
      toast.success("Sessão terminada.");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "auth/logout");
      toast.error("Erro ao terminar sessão.");
    } finally {
      set({ isLoading: false });
    }
  },
}));
