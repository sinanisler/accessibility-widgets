import { EditorClient } from "./editor-client";

export default async function SiteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditorClient siteId={id} />;
}
