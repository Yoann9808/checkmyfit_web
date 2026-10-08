import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Nouveau produit" };

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-palissandre">Nouveau produit</h1>
      <ProductForm />
    </div>
  );
}
