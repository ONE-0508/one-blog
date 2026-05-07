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
  HasMany,
} from 'sequelize-typescript';
import { Article } from '@/models/article.model';

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Table({
  tableName: 'categories',
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
      fields: ['sort'],
    },
    {
      fields: ['is_deleted'],
    },
  ],
})
export class Category extends Model {
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

  @Default(0)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare sort: number;

  @Default(CategoryStatus.ACTIVE)
  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(CategoryStatus)),
  })
  declare status: CategoryStatus;

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

  @HasMany(() => Article)
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
