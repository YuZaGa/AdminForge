import { CollectionSchemaPage } from "adminforge/ui";
import { getConfig } from "../../../../lib/adminforge";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: collectionName } = await params;
  const config = getConfig();
  const collection = config.collections.find((c) => c.name === collectionName);

  if (!collection) {
    notFound();
  }

  // Sanitize for client (strip Zod schemas and functions)
  const sanitize = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (key === 'validation' || key === 'hooks') return undefined;
      return value;
    }));
  };

  return <CollectionSchemaPage config={sanitize(config)} collection={sanitize(collection)} role="admin" />;
}
