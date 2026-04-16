"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VariantTable } from "./variant-table";
import { ImageManager } from "./image-manager";

const defaultVariant = {
  name: "Default",
  sku: "",
  price: "",
  compareAtPrice: "",
  stock: 0,
  lowStockThreshold: 5,
  isActive: true,
  sortOrder: 0,
};

export function ProductForm({ productId }) {
  const router = useRouter();
  const isEdit = !!productId;

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    type: "laptop",
    brand: "",
    hsnCode: "",
    gstPercent: 18,
    isPublished: false,
    isFeatured: false,
    processor: "",
    ram: "",
    storage: "",
    display: "",
    gpu: "",
    os: "",
    conditionGrade: "",
    warrantyMonths: "",
  });

  const [variants, setVariants] = useState([{ ...defaultVariant }]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/categories");
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch {
      // silent
    }
  }, []);

  const loadProduct = useCallback(async () => {
    if (!productId) return;
    try {
      const res = await apiFetch(`/api/admin/products/${productId}`);
      if (res.ok) {
        const json = await res.json();
        const p = json.data;
        setForm({
          categoryId: p.categoryId || "",
          name: p.name || "",
          slug: p.slug || "",
          description: p.description || "",
          type: p.type || "laptop",
          brand: p.brand || "",
          hsnCode: p.hsnCode || "",
          gstPercent: p.gstPercent ?? 18,
          isPublished: p.isPublished ?? false,
          isFeatured: p.isFeatured ?? false,
          processor: p.processor || "",
          ram: p.ram || "",
          storage: p.storage || "",
          display: p.display || "",
          gpu: p.gpu || "",
          os: p.os || "",
          conditionGrade: p.conditionGrade || "",
          warrantyMonths: p.warrantyMonths ?? "",
        });
        if (p.variants?.length) setVariants(p.variants);
        if (p.images?.length) setImages(p.images);
      }
    } catch {
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadCategories();
    loadProduct();
  }, [loadCategories, loadProduct]);

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.slug) delete payload.slug;
      if (payload.warrantyMonths === "") delete payload.warrantyMonths;
      else payload.warrantyMonths = Number(payload.warrantyMonths);
      payload.gstPercent = Number(payload.gstPercent);

      if (payload.type !== "laptop") {
        delete payload.processor;
        delete payload.ram;
        delete payload.storage;
        delete payload.display;
        delete payload.gpu;
        delete payload.os;
        delete payload.conditionGrade;
        delete payload.warrantyMonths;
      }

      if (isEdit) {
        const res = await apiFetch(`/api/admin/products/${productId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (res.ok) {
          toast.success("Product updated");
        } else {
          toast.error(json.message || "Update failed");
        }
      } else {
        payload.variants = variants.map((v) => ({
          ...v,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          stock: Number(v.stock),
          lowStockThreshold: Number(v.lowStockThreshold),
        }));

        const res = await apiFetch("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (res.ok) {
          toast.success("Product created");
          router.push(`/admin/products/${json.data.id}/edit`);
        } else {
          toast.error(json.message || "Create failed");
        }
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          {isEdit && <TabsTrigger value="images">Images</TabsTrigger>}
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Product Name *</Label>
                  <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug (auto-generated)</Label>
                  <Input value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} placeholder="Leave blank to auto-generate" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Category *</Label>
                  <Select value={form.categoryId} onValueChange={(v) => handleChange("categoryId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Type *</Label>
                  <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="accessory">Accessory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Brand</Label>
                  <Input value={form.brand} onChange={(e) => handleChange("brand", e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>HSN Code</Label>
                  <Input value={form.hsnCode} onChange={(e) => handleChange("hsnCode", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>GST %</Label>
                  <Input type="number" min={0} max={100} step={0.01} value={form.gstPercent} onChange={(e) => handleChange("gstPercent", e.target.value)} />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.isPublished} onCheckedChange={(v) => handleChange("isPublished", v)} />
                  <Label>Published</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.isFeatured} onCheckedChange={(v) => handleChange("isFeatured", v)} />
                  <Label>Featured</Label>
                </div>
              </div>

              {form.type === "laptop" && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="mb-3 text-sm font-semibold">Laptop Specifications</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-1.5"><Label>Processor</Label><Input value={form.processor} onChange={(e) => handleChange("processor", e.target.value)} /></div>
                      <div className="space-y-1.5"><Label>RAM</Label><Input value={form.ram} onChange={(e) => handleChange("ram", e.target.value)} placeholder="e.g. 8GB" /></div>
                      <div className="space-y-1.5"><Label>Storage</Label><Input value={form.storage} onChange={(e) => handleChange("storage", e.target.value)} placeholder="e.g. 256GB SSD" /></div>
                      <div className="space-y-1.5"><Label>Display</Label><Input value={form.display} onChange={(e) => handleChange("display", e.target.value)} /></div>
                      <div className="space-y-1.5"><Label>GPU</Label><Input value={form.gpu} onChange={(e) => handleChange("gpu", e.target.value)} /></div>
                      <div className="space-y-1.5"><Label>OS</Label><Input value={form.os} onChange={(e) => handleChange("os", e.target.value)} placeholder="e.g. Windows 11" /></div>
                      <div className="space-y-1.5"><Label>Condition Grade</Label><Input value={form.conditionGrade} onChange={(e) => handleChange("conditionGrade", e.target.value)} placeholder="e.g. A+" /></div>
                      <div className="space-y-1.5"><Label>Warranty (months)</Label><Input type="number" min={0} value={form.warrantyMonths} onChange={(e) => handleChange("warrantyMonths", e.target.value)} /></div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <VariantTable
                variants={variants}
                onChange={setVariants}
                productId={productId}
              />
              {isEdit && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Variant changes on an existing product should be managed via the backend admin variant API.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isEdit && (
          <TabsContent value="images" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <ImageManager
                  productId={productId}
                  images={images}
                  onRefresh={loadProduct}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
