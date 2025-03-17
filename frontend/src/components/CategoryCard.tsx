// 'use client';

// import Link from 'next/link';
// import { Category } from '../services/api';

// interface CategoryCardProps {
//   category: Category;
// }

// export default function CategoryCard({ category }: CategoryCardProps) {
//   const { attributes } = category;
//   const { name, description, slug } = attributes;
  
//   return (
//     <Link href={`/category/${slug}`}>
//       <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md p-6">
//         <h3 className="text-lg font-medium text-gray-900">{name}</h3>
//         {description && (
//           <p className="mt-2 text-sm text-gray-500 line-clamp-2">{description}</p>
//         )}
//         <div className="mt-4">
//           <span className="inline-flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-500">
//             View Products
//             <svg className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </span>
//         </div>
//       </div>
//     </Link>
//   );
// } 