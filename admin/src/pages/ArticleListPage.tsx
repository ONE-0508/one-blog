import { useEffect, useState } from "react";
import { Link } from "react-router";
import { deleteArticle, fetchArticles } from "../api/articles";
import type { Article } from "../types/article";
import { formatDate } from "../utils/formatDate";

function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await fetchArticles(page, pageSize);
      if (response.success) {
        setArticles(response.data.data);
        setTotal(response.data.total);
      } else {
        setErrorMessage(response.error?.message ?? "加载文章失败");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "加载文章失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadArticles();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要删除这篇文章吗？")) return;

    try {
      await deleteArticle(id);
      await loadArticles();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "删除失败");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>文章管理</h1>
          <p className="muted">当前共 {total} 篇文章</p>
        </div>
        <Link className="primary" to="/articles/new">
          新建文章
        </Link>
      </header>

      {isLoading ? (
        <div className="card">加载中...</div>
      ) : errorMessage ? (
        <div className="card error">{errorMessage}</div>
      ) : articles.length === 0 ? (
        <div className="card">暂无文章</div>
      ) : (
        <div className="table">
          <div className="table-header">
            <span>标题</span>
            <span>作者</span>
            <span>创建时间</span>
            <span>阅读量</span>
            <span>操作</span>
          </div>
          {articles.map((article) => (
            <div key={article.id} className="table-row">
              <span>{article.title}</span>
              <span>
                {article.author?.displayName ?? article.author?.username ?? "-"}
              </span>
              <span>{formatDate(article.createdAt)}</span>
              <span>{article.viewCount}</span>
              <span className="actions">
                <Link className="link" to={`/articles/${article.id}/edit`}>
                  编辑
                </Link>
                <button
                  type="button"
                  className="link danger"
                  onClick={() => handleDelete(article.id)}
                >
                  删除
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            上一页
          </button>
          <span>
            第 {page} / {totalPages} 页
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}

export default ArticleListPage;
