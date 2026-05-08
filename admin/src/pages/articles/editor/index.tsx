import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Message, Select, Space } from '@arco-design/web-react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import qs from 'query-string';
import MDEditor from '@uiw/react-md-editor';

import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

interface CategoryOption {
  label: string;
  value: string;
}

interface TagOption {
  label: string;
  value: string;
  color: string;
  status: 'active' | 'inactive';
}

export default function ArticleEditor() {
  const history = useHistory();
  const location = useLocation();
  const query = useMemo(() => qs.parse(location.search), [location.search]);
  const articleId = typeof query.id === 'string' ? query.id : undefined;
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    axios
      .get('/categories/options')
      .then((res) => {
        const categories = res.data?.data?.categories || [];
        setCategoryOptions(
          categories.map((category) => ({
            label: category.name,
            value: category.id,
          }))
        );
      })
      .catch(() => {
        Message.error('分类列表加载失败');
      });
  }, []);

  useEffect(() => {
    axios
      .get('/tags/options')
      .then((res) => {
        const tags = res.data?.data?.tags || [];
        setTagOptions(
          tags.map((tag) => ({
            label: tag.name,
            value: tag.id,
            color: tag.color,
            status: tag.status,
          }))
        );
      })
      .catch(() => {
        Message.error('标签列表加载失败');
      });
  }, []);

  useEffect(() => {
    if (!articleId) return;
    setLoading(true);
    axios
      .get(`/articles/${articleId}`)
      .then((res) => {
        const article = res.data?.data?.article;
        if (article) {
          form.setFieldsValue({
            title: article.title,
            categoryId: article.categoryId || article.category?.id,
            content: article.content,
            tagIds: (article.tagDetails || []).map((tag) => tag.id),
          });
        }
      })
      .catch(() => {
        Message.error('加载文章失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [articleId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      const payload = {
        title: values.title,
        categoryId: values.categoryId,
        content: values.content,
        tagIds: values.tagIds || [],
      };

      setLoading(true);
      if (articleId) {
        await axios.put(`/articles/${articleId}`, payload);
        Message.success('更新成功');
      } else {
        await axios.post('/articles', payload);
        Message.success('创建成功');
      }
      history.push('/articles/list');
    } catch (error) {
      if (error?.message) {
        Message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={articleId ? '编辑文章' : '新建文章'}>
      <Form form={form} layout="vertical" style={{ maxWidth: 860 }}>
        <Form.Item
          label="标题"
          field="title"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>
        <Form.Item label="标签" field="tagIds">
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="请选择标签"
          >
            {tagOptions.map((tag) => (
              <Select.Option key={tag.value} value={tag.value} disabled={tag.status !== 'active'}>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      marginRight: 6,
                      backgroundColor: tag.color,
                    }}
                  />
                  {tag.label}
                  {tag.status !== 'active' ? '（禁用）' : ''}
                </span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="分类" field="categoryId">
          <Select
            allowClear
            placeholder="请选择分类，留空将归入未分类"
            options={categoryOptions}
          />
        </Form.Item>
        <Form.Item
          label="内容"
          field="content"
          rules={[{ required: true, message: '请输入内容' }]}
        >
          <MDEditor
            height={420}
            preview="edit"
            textareaProps={{
              placeholder:
                '支持 Markdown 富文本。代码块示例：\n```ts\nconst hello = "world";\n```',
            }}
          />
        </Form.Item>
        <div style={{ marginTop: -8, marginBottom: 16, color: 'var(--color-text-3)', fontSize: 12 }}>
          支持标题、粗体、引用、表格、链接、图片和代码块（```语言）
        </div>
        <Space>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {articleId ? '保存修改' : '创建文章'}
          </Button>
          <Button onClick={() => history.push('/articles/list')}>返回列表</Button>
        </Space>
      </Form>
    </Card>
  );
}
