import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <h2 className="text-4xl font-black text-[#002B7F] mb-2">404</h2>

      <Link href="/" className="bg-[#002B7F] text-white px-8 py-3 rounded-xl font-black hover:opacity-90 transition-all">
        Return Home
      </Link>
    </div>
  );
}
