"use client";

import { useState, useRef } from "react";
import { apiFetch, apiUpload } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2 } from "lucide-react";

export function ImageManager({ productId, images, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState("");
  const fileRef = useRef(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Select an image file");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      if (altText) fd.append("altText", altText);
      fd.append("sortOrder", String(images.length));

      const res = await apiUpload(`/api/admin/products/${productId}/images`, fd);
      const json = await res.json();

      if (res.ok) {
        toast.success("Image uploaded");
        setAltText("");
        if (fileRef.current) fileRef.current.value = "";
        onRefresh();
      } else {
        toast.error(json.message || "Upload failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId) {
    try {
      const res = await apiFetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Image deleted");
        onRefresh();
      } else {
        const json = await res.json();
        toast.error(json.message || "Delete failed");
      }
    } catch {
      toast.error("Network error");
    }
  }

  if (!productId) {
    return (
      <p className="text-sm text-muted-foreground">
        Save the product first to upload images.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-dashed p-4">
        <div className="space-y-1.5">
          <Label>Image File (JPEG, PNG, WebP &mdash; max 5MB)</Label>
          <Input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" />
        </div>
        <div className="space-y-1.5">
          <Label>Alt Text (optional)</Label>
          <Input value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the image" />
        </div>
        <Button type="button" onClick={handleUpload} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-lg border">
              <img
                src={img.url}
                alt={img.altText || "Product image"}
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex w-full items-center justify-between p-2">
                  <span className="truncate text-xs text-white">
                    {img.altText || "No alt text"}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => handleDelete(img.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
