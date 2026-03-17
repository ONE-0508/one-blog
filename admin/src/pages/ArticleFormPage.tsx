import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  createArticle,
  fetchArticleById,
  updateArticle,
} from "../api/articles";

function ArticleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const tagArray = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags],
  );

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await fetchArticleById(id);
        if (response.success) {
          setTitle(response.data.article.title);
          setTags(response.data.article.tags.join(", "));
          setContent(response.data.article.content);
        } else {
          setErrorMessage(response.error?.message ?? "加载文章失败");
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "加载文章失败",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadArticle();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage("请输入标题");
      return;
    }

    if (!content.trim()) {
      setErrorMessage("请输入正文内容");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      if (isEdit && id) {
        await updateArticle(id, {
          title,
          content,
          tags: tagArray,
        });
      } else {
        await createArticle({
          title,
          content,
          tags: tagArray,
        });
      }

      navigate("/articles");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{isEdit ? "编辑文章" : "新建文章"}</h1>
          <p className="muted">支持 Markdown 内容（含代码块）</p>
        </div>
      </header>

      <form className="card form" onSubmit={handleSubmit}>
        <label className="field">
          <span>标题</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="field">
          <span>标签（逗号分隔）</span>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </label>
        <label className="field">
          <span>正文内容</span>
          <textarea
            rows={12}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </label>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <div className="actions">
          <button
            type="button"
            className="ghost"
            onClick={() => navigate("/articles")}
          >
            取消
          </button>
          <button type="submit" className="primary" disabled={isLoading}>
            {isLoading ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArticleFormPage;
