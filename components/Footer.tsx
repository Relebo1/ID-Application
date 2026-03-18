export default function Footer() {
  return (
    <footer className="bg-[#003580] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <h2 className="font-bold text-base mb-2">Ministry of Home Affairs</h2>
          <p className="text-blue-200">Kingdom of Lesotho</p>
          <p className="text-blue-200 mt-1">Maseru, Lesotho</p>
        </div>
        <div>
          <h2 className="font-bold text-base mb-2">Quick Links</h2>
          <ul className="space-y-1 text-blue-200">
            <li><a href="/register" className="hover:text-white">Register for ID</a></li>
            <li><a href="/track" className="hover:text-white">Track Application</a></li>
            <li><a href="/login" className="hover:text-white">My Account</a></li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-base mb-2">Contact</h2>
          <p className="text-blue-200">Email: homeaffairs@gov.ls</p>
          <p className="text-blue-200">Tel: +266 2231 2000</p>
          <p className="text-blue-200 mt-2 text-xs">
            Accessibility: This portal supports screen readers and keyboard navigation.
          </p>
        </div>
      </div>
      <div className="border-t border-blue-700 text-center py-3 text-xs text-blue-300">
        © {new Date().getFullYear()} Government of Lesotho. All rights reserved.
      </div>
    </footer>
  );
}
