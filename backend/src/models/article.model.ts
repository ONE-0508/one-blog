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
import { User } from '@/models/user.model';

@Table({
  tableName: 'articles',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['author_id'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['is_deleted'],
    },
  ],
})
export class Article extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(200))
  declare title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare content: string;

  @Default([])
  @AllowNull(false)
  @Column(DataType.JSON)
  declare tags: string[];

  @Default(0)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'view_count',
  })
  declare viewCount: number;

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

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    field: 'author_id',
  })
  declare authorId: string;

  @BelongsTo(() => User)
  declare author?: User;

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
