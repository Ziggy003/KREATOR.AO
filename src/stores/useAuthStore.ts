import { create } from "zustand";
import { User as AppUser, CreatorProfile, BrandProfile } from "../types";
import { auth, db, signInWithGoogle, signInWithFacebook, logout as firebaseLogout, handleFirestoreError, OperationType } from "../lib/firebase";
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
  login: (type?: AppUser["type"], provider?: "google" | "facebook") => Promise<void>;
  logout: () => Promise<void>;
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

  login: async (type?: AppUser["type"], provider: "google" | "facebook" = "google") => {
    set({ isLoading: true });
    try {
      const result = provider === "google" ? await signInWithGoogle() : await signInWithFacebook();
      const user = result.user;
      
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
            balance: { aoa: 0, usd: 0 }
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
      toast.success("Login efectuado com sucesso!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "auth/login");
      toast.error("Erro ao efectuar login.");
    } finally {
      set({ isLoading: false });
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
