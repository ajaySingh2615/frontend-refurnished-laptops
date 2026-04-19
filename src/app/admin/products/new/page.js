"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/page-header";

export default function NewProductPage() {
  return (
    <div className="space-y-7">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to products
      </Link>
      <AdminPageHeader
        eyebrow="Catalog"
        title="New product"
        description="Create a new product. You can add variants and images after the basic details are saved."
      />
      <ProductForm />
    </div>
  );
}
