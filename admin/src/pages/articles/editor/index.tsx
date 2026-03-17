import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Message, Space } from '@arco-design/web-react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import qs from 'query-string';

const { TextArea } = Input;

export default function ArticleEditor() {
  const history = useHistory();
  const location = useLocation();
  const query = useMemo(() => qs.parse(location.search), [location.search]);
  const articleId = typeof query.id === 'string' ? query.id : undefined;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

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
            content: article.content,
            tags: (article.tags || []).join(', '),
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
        content: values.content,
        tags: values.tags
          ? values.tags
              .split(',')
              .map((item: string) => item.trim())
              .filter(Boolean)
          : [],
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
      <Form form={form} layout="vertical" style={{ maxWidth: 720 }}>
        <Form.Item
          label="标题"
          field="title"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>
        <Form.Item label="标签" field="tags">
          <Input placeholder="多个标签用英文逗号分隔" />
        </Form.Item>
        <Form.Item
          label="内容"
          field="content"
          rules={[{ required: true, message: '请输入内容' }]}
        >
          <TextArea rows={12} placeholder="请输入内容" />
        </Form.Item>
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
