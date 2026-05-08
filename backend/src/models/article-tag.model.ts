import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Article } from '@/models/article.model';
import { Tag } from '@/models/tag.model';

@Table({
  tableName: 'article_tags',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['article_id', 'tag_id'],
    },
    {
      fields: ['article_id'],
    },
    {
      fields: ['tag_id'],
    },
  ],
})
export class ArticleTag extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Article)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'article_id',
  })
  declare articleId: string;

  @BelongsTo(() => Article)
  declare article?: Article;

  @ForeignKey(() => Tag)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'tag_id',
  })
  declare tagId: string;

  @BelongsTo(() => Tag)
  declare tag?: Tag;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  declare updatedAt: Date;
}
