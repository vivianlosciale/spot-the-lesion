interface TextItem {
  text: string;
  imageSrc?: string;
}

interface ExplanationItem {
  title: string;
  body: TextItem[];
}