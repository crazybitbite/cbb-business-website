import { redirect } from "next/navigation"

// Tools live under Digital Products: /digital-products/tools/...
export default function ToolsIndexRedirect() {
    redirect("/digital-products/tools")
}
