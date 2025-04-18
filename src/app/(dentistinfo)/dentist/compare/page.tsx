import Link from 'next/link';
import TopMenu from '@/components/TopMenu';

export default function Dentist() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopMenu />
      
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Compare Dentists</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link> / <Link href="/dentist" className="hover:text-blue-600">Dentists</Link> / <span>Compare</span>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Your smile, your choice</h2>
        <p className="text-3xl font-bold text-[#4AA3BA]">compare and find the dentist who suits you best</p>
      </div>
    </div>
  );
}