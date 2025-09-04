export default async function handler(req, res) {
  const response = await fetch('https://newsapi.org/v2/everything?q=Trump&apiKey=YOUR_API_KEY', { next: { revalidate: 28800 } });
  const data = await response.json();
  const digest = data.articles.slice(0, 3).map(article => ({
    title: article.title,
    summary: `${article.description} [${article.content?.slice(0, 100) || ''}]`,
    link: article.url
  }));
  res.status(200).json(digest);
}
