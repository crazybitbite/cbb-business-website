import { redirect } from "next/navigation"

// Tools live under Digital Products: /digital-products/tools/...
export default function ToolsPathRedirect({ params }: { params: { path: string[] } }) {
    redirect(`/digital-products/tools/${params.path.join("/")}`)
}
