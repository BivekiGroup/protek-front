import React from 'react';
import { generateJsonLdScript } from '@/lib/schema';

interface JsonLdScriptProps {
  schema: object;
}

// Компонент для вставки JSON-LD разметки
const JsonLdScript: React.FC<JsonLdScriptProps> = ({ schema }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: generateJsonLdScript(schema)
      }}
    />
  );
};

export default JsonLdScript; 