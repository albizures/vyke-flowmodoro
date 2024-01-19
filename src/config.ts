export type Site = {
  website: string;
  author: string;
  description: string;
  title: string;
  ogImage?: string;
  lightAndDarkMode: boolean;
  postPerPage: number;
};

export const SITE: Site = {
  website: "https://flowmodoro.vyke.dev",
  author: "Jose Albizures",
  description:
    "Flowmodoro, allows you to take advantage of flow state to complete your to do list.",
  title: "Flowmodoro by Vyke",

  // ogImage: 'main.jpg',
  lightAndDarkMode: true,
  postPerPage: 6,
};
