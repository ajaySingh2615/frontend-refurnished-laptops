"use client";

import { use } from "react";
import { ProductForm } from "@/components/admin/product-form";

export default function EditProductPage({ params }) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold">
        Edit Product
      </h1>
      <ProductForm productId={id} />
    </div>
  );
}
