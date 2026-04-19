"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
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
import { normalizeAdminVariant } from "@/lib/product-admin-utils";

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

function Section({ title, description, children }) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({ label, required, children, hint, span }) {
  return (
    <div className={`space-y-1.5 ${span === 2 ? "sm:col-span-2" : span === 3 ? "sm:col-span-3" : ""}`}>
      <Label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

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
    gstPercent: "18",
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
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.message || "Could not load product");
        setLoading(false);
        return;
      }
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
        gstPercent:
          p.gstPercent != null && p.gstPercent !== ""
            ? String(Number(p.gstPercent))
            : "18",
        isPublished: p.isPublished ?? false,
        isFeatured: p.isFeatured ?? false,
        processor: p.processor || "",
        ram: p.ram || "",
        storage: p.storage || "",
        display: p.display || "",
        gpu: p.gpu || "",
        os: p.os || "",
        conditionGrade: p.conditionGrade || "",
        warrantyMonths:
          p.warrantyMonths != null && p.warrantyMonths !== ""
            ? String(p.warrantyMonths)
            : "",
      });
      if (p.variants?.length) {
        setVariants(p.variants.map(normalizeAdminVariant));
      } else {
        setVariants([{ ...defaultVariant }]);
      }
      setImages(p.images || []);
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
      payload.gstPercent = Number(payload.gstPercent || 0);

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
    return <p className="text-sm text-muted-foreground">Loading product...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-5 space-y-6">
          <Section title="Basic information" description="Core details that describe this product.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Product name" required>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </Field>
              <Field label="Slug" hint="Leave blank to auto-generate from name.">
                <Input
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="product-slug"
                />
              </Field>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <Field label="Category" required>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => handleChange("categoryId", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Type" required>
                <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Brand">
                <Input
                  value={form.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                />
              </Field>
            </div>
          </Section>

          <Section title="Tax & visibility" description="Statutory codes and where this product appears.">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="HSN code">
                <Input
                  value={form.hsnCode}
                  onChange={(e) => handleChange("hsnCode", e.target.value)}
                />
              </Field>
              <Field label="GST %">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={form.gstPercent}
                  onChange={(e) => handleChange("gstPercent", e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap gap-6 border-t border-border pt-5">
              <label className="flex items-center gap-2.5">
                <Switch
                  checked={form.isPublished}
                  onCheckedChange={(v) => handleChange("isPublished", v)}
                />
                <span className="text-sm font-medium text-foreground">Published</span>
              </label>
              <label className="flex items-center gap-2.5">
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(v) => handleChange("isFeatured", v)}
                />
                <span className="text-sm font-medium text-foreground">Featured</span>
              </label>
            </div>
          </Section>

          {form.type === "laptop" && (
            <Section title="Laptop specifications" description="Technical details surfaced on the product page.">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Processor">
                  <Input value={form.processor} onChange={(e) => handleChange("processor", e.target.value)} />
                </Field>
                <Field label="RAM">
                  <Input value={form.ram} onChange={(e) => handleChange("ram", e.target.value)} placeholder="8GB" />
                </Field>
                <Field label="Storage">
                  <Input value={form.storage} onChange={(e) => handleChange("storage", e.target.value)} placeholder="256GB SSD" />
                </Field>
                <Field label="Display">
                  <Input value={form.display} onChange={(e) => handleChange("display", e.target.value)} />
                </Field>
                <Field label="GPU">
                  <Input value={form.gpu} onChange={(e) => handleChange("gpu", e.target.value)} />
                </Field>
                <Field label="Operating system">
                  <Input value={form.os} onChange={(e) => handleChange("os", e.target.value)} placeholder="Windows 11" />
                </Field>
                <Field label="Condition grade">
                  <Input value={form.conditionGrade} onChange={(e) => handleChange("conditionGrade", e.target.value)} placeholder="A+" />
                </Field>
                <Field label="Warranty (months)">
                  <Input
                    type="number"
                    min={0}
                    value={form.warrantyMonths}
                    onChange={(e) => handleChange("warrantyMonths", e.target.value)}
                  />
                </Field>
              </div>
            </Section>
          )}
        </TabsContent>

        <TabsContent value="variants" className="mt-5">
          <Section title="Variants" description="Configure SKUs, pricing and stock thresholds.">
            <VariantTable
              variants={variants}
              onChange={setVariants}
              productId={isEdit ? productId : undefined}
              onSaved={isEdit ? loadProduct : undefined}
            />
          </Section>
        </TabsContent>

        <TabsContent value="images" className="mt-5">
          {isEdit ? (
            <Section
              title="Images"
              description="Photos apply to the whole listing. Optionally link a photo to one variant (e.g. different colour) or leave “All variants” for shared shots."
            >
              <ImageManager
                productId={productId}
                images={images}
                variants={variants.filter((v) => v.id)}
                onRefresh={loadProduct}
              />
            </Section>
          ) : (
            <Section
              title="Images"
              description="Uploads are available after the product is created."
            >
              <p className="text-sm text-muted-foreground">
                Save this product with <strong className="text-foreground">Create product</strong> below. You&apos;ll be
                taken to edit mode where you can upload images and choose whether each image is for a specific variant
                or for all variants.
              </p>
            </Section>
          )}
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Update product" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
