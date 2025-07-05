import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  return (
    <Button asChild variant="link" className="mb-4">
      <Link to="/">
        <ArrowLeft className="inline mr-1" /> Voltar para fotos
      </Link>
    </Button>
  );
}
