"use client";

import { useState, useRef } from "react";
import { apiFetch, apiUpload } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Trash2, ImageIcon } from "lucide-react";

export function ImageManager({ productId, images, variants = [], onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState("");
  const [uploadVariantId, setUploadVariantId] = useState("all");
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
      if (uploadVariantId && uploadVariantId !== "all") {
        fd.append("variantId", uploadVariantId);
      }

      const res = await apiUpload(`/api/admin/products/${productId}/images`, fd);
      const json = await res.json();

      if (res.ok) {
        toast.success("Image uploaded");
        setAltText("");
        setUploadVariantId("all");
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

  async function handleVariantChange(imageId, value) {
    const variantId = value === "all" ? null : value;
    try {
      const res = await apiFetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "PUT",
        body: JSON.stringify({ variantId }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Image updated");
        onRefresh();
      } else {
        toast.error(json.message || "Update failed");
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

        <div className="mt-4 space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            Show this image for
          </Label>
          <Select value={uploadVariantId} onValueChange={setUploadVariantId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Choose variant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All variants (shared gallery)</SelectItem>
              {variants.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name} — {v.sku}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            On the shop, customers see images for their selected variant when you assign variant-specific photos;
            otherwise they see all shared images.
          </p>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="relative aspect-square bg-muted">
                <img
                  src={img.url}
                  alt={img.altText || "Product image"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 border-t border-border p-3">
                <p className="truncate text-xs text-muted-foreground">
                  {img.altText || "No alt text"}
                </p>
                <div className="space-y-1">
                  <Label className="text-[11px] text-foreground">Assigned to</Label>
                  <Select
                    value={img.variantId || "all"}
                    onValueChange={(v) => handleVariantChange(img.id, v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All variants</SelectItem>
                      {variants.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} — {v.sku}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="destructive-outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDelete(img.id)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Remove image
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
