import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface GalleryPhoto {
  id: string;
  /** Cloudinary URL or data-URL fallback */
  src: string;
  caption?: string;
  date?: string;
  mode?: string;
  frame?: string;
  createdAt?: Timestamp;
}

interface GalleryDocData {
  src: string;
  caption: string;
  date: string;
  mode: string;
  frame: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

const COLLECTION = "gallery";

// ─── Cloudinary config (reuse from StripSharingScreen) ───────────────────────
const CLOUDINARY_CLOUD_NAME = "dopc9l096";
const CLOUDINARY_UPLOAD_PRESET = "puffsnap_uploads";

/**
 * Upload a base64 data-URL to Cloudinary and return the hosted URL.
 * Returns `null` if upload fails.
 */
async function uploadToCloudinary(dataUrl: string): Promise<string | null> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    const form = new FormData();
    form.append("file", blob);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    form.append("folder", "puffsnap-gallery");

    const upload = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: form }
    );

    if (!upload.ok) throw new Error("Cloudinary upload failed");
    const data = await upload.json();
    return data.secure_url as string;
  } catch (err) {
    console.warn("Gallery Cloudinary upload failed:", err);
    return null;
  }
}

// ─── Save to Firestore ───────────────────────────────────────────────────────
export async function saveToGallery(strip: {
  /** base64 data URL or Cloudinary URL */
  stripImage: string;
  /** optional pre-uploaded Cloudinary URL */
  cloudinaryUrl?: string;
  mode: number;
  frame: string;
}): Promise<void> {
  // Prefer an already-uploaded Cloudinary URL; otherwise upload now
  let imageUrl = strip.cloudinaryUrl || null;

  if (!imageUrl && strip.stripImage.startsWith("data:")) {
    imageUrl = await uploadToCloudinary(strip.stripImage);
  }

  // Final fallback: store the data URL directly (works but large)
  const src = imageUrl || strip.stripImage;

  const docData: GalleryDocData = {
    src,
    caption: `${strip.mode}-shot ${strip.frame} strip`,
    date: new Date().toLocaleDateString(),
    mode: `${strip.mode}-shot`,
    frame: strip.frame,
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, COLLECTION), docData);

  // Also keep a localStorage copy as offline fallback
  try {
    const saved = localStorage.getItem("puffsnap-gallery");
    const gallery: GalleryPhoto[] = saved ? JSON.parse(saved) : [];
    gallery.push({
      id: `strip-${Date.now()}`,
      src,
      caption: docData.caption,
      date: docData.date,
      mode: docData.mode,
      frame: docData.frame,
    });
    localStorage.setItem("puffsnap-gallery", JSON.stringify(gallery));
  } catch {
    // ignore
  }
}

// ─── Load from Firestore ─────────────────────────────────────────────────────
export async function loadGallery(): Promise<GalleryPhoto[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as GalleryPhoto[];
  } catch (err) {
    console.warn("Firestore gallery load failed, falling back to localStorage:", err);
    // Fallback to localStorage
    const saved = localStorage.getItem("puffsnap-gallery");
    if (saved) {
      try {
        return JSON.parse(saved) as GalleryPhoto[];
      } catch {
        return [];
      }
    }
    return [];
  }
}

// ─── Delete from Firestore ───────────────────────────────────────────────────
export async function deleteFromGallery(photoId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, photoId));
  } catch (err) {
    console.warn("Failed to delete from Firestore:", err);
  }

  // Also remove from localStorage fallback
  try {
    const saved = localStorage.getItem("puffsnap-gallery");
    if (saved) {
      const gallery: GalleryPhoto[] = JSON.parse(saved);
      localStorage.setItem(
        "puffsnap-gallery",
        JSON.stringify(gallery.filter((p) => p.id !== photoId))
      );
    }
  } catch {
    // ignore
  }
}
