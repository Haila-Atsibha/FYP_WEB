import Footer from "../../src/components/Footer";

export default function PublicLayout({ children }) {
  return (
    <>
      <div className="flex-1 flex flex-col relative z-0">{children}</div>
      <Footer />
    </>
  );
}
