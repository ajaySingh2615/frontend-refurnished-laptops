"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/page-header";

export default function EditProductPage({ params }) {
  const { id } = use(params);

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
        title="Edit product"
        description="Update product details, manage variants, and curate images."
      />
      <ProductForm productId={id} />
    </div>
  );
}
