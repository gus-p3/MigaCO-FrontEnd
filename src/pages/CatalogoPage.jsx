import Navbar from "../components/common/Navbar";
import Catalog from "../components/catalog/Catalog";
import ChatButton from "../components/common/ChatButton";

export default function CatalogoPage() {
  return (
    <>
      
      <main>
        <Catalog />
      </main>
      <ChatButton />
    </>
  );
}
