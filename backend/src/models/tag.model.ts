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
  Unique,
  BelongsToMany,
} from 'sequelize-typescript';
import { Article } from '@/models/article.model';
import { ArticleTag } from '@/models/article-tag.model';

export enum TagStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Table({
  tableName: 'tags',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['slug'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['is_deleted'],
    },
  ],
})
export class Tag extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(30))
  declare name: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(80))
  declare slug: string;

  @Column(DataType.TEXT)
  declare description?: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare color: string;

  @Default(TagStatus.ACTIVE)
  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(TagStatus)),
  })
  declare status: TagStatus;

  @Default(false)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_deleted',
  })
  declare isDeleted: boolean;

  @Column({
    type: DataType.DATE,
    field: 'deleted_at',
  })
  declare deletedAt?: Date | null;

  @BelongsToMany(() => Article, () => ArticleTag)
  declare articles?: Article[];

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
