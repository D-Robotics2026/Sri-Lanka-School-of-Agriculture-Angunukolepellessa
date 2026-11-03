import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDLrXt7os1oaMCIcD3MVP7MYWknGAnimSc",
  authDomain: "agri-school-management-s-8539a.firebaseapp.com",
  projectId: "agri-school-management-s-8539a",
  storageBucket: "agri-school-management-s-8539a.firebasestorage.app",
  messagingSenderId: "83532679810",
  appId: "1:83532679810:web:12d2142c0b57f25979c29b",
  measurementId: "G-RS46Y3CGQK"
};

// Create or reuse secondary Firebase App for user provisioning without interrupting current admin session
function getProvisionerAuth() {
  const existingApp = getApps().find((a) => a.name === "SOA_AuthProvisioner");
  const provisionApp = existingApp || initializeApp(firebaseConfig, "SOA_AuthProvisioner");
  return getAuth(provisionApp);
}

/**
 * Creates an account in Firebase Authentication without switching current user session.
 */
export async function createFirebaseAuthAccount(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const provAuth = getProvisionerAuth();
    await createUserWithEmailAndPassword(provAuth, email, password);
    await signOut(provAuth);
    return { success: true };
  } catch (err: any) {
    if (err.code === "auth/email-already-in-use") {
      return { success: true };
    }
    console.warn("[Firebase Auth Provisioning]", err.code, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Bulk provisions a list of system user accounts directly into Firebase Authentication.
 */
export async function syncAllUsersToFirebaseAuth(
  users: { email?: string; username: string; passwordHash: string }[]
): Promise<{ total: number; created: number }> {
  let created = 0;
  for (const u of users) {
    const email =
      u.email && u.email.includes("@")
        ? u.email.trim().toLowerCase()
        : `${u.username.toLowerCase().replace(/[^a-z0-9]/g, "")}@soa.doa.gov.lk`;
    const password = u.passwordHash && u.passwordHash.length >= 6 ? u.passwordHash : "Admin@123";
    const res = await createFirebaseAuthAccount(email, password);
    if (res.success) created++;
  }
  return { total: users.length, created };
}
