"use client";

import { useState, useRef } from "react";
import { apiFetch, apiUpload } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, ImageIcon } from "lucide-react";

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
    <div className="space-y-6">
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Image file
            </Label>
            <Input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />
            <p className="text-[11px] text-muted-foreground">
              JPEG, PNG or WebP. Max 5MB.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Alt text (optional)
            </Label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={handleUpload} disabled={uploading}>
            <Upload className="mr-1.5 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload image"}
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/20 px-6 py-12 text-center">
          <ImageIcon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm font-medium text-foreground">No images yet</p>
          <p className="text-xs text-muted-foreground">
            Upload your first image to start building the gallery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText || "Product image"}
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex w-full items-center justify-between gap-2 p-2.5">
                  <span className="truncate text-xs text-background">
                    {img.altText || "No alt text"}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => handleDelete(img.id)}
                    aria-label="Delete image"
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
