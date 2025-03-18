import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Categories - Buzzat',
  description: 'Browse products by category on Buzzat',
};

export default function ProductCategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 