import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
  GUEST = 'guest',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['username'],
    },
    {
      unique: true,
      fields: ['email'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['created_at'],
    },
  ],
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING(50),
    validate: {
      len: [3, 50],
      is: /^[a-zA-Z0-9_]+$/,
    },
  })
  declare username: string;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare passwordHash: string;

  @Column({
    type: DataType.STRING(100),
    field: 'display_name',
  })
  declare displayName?: string;

  @Column({
    type: DataType.TEXT,
    field: 'avatar_url',
  })
  declare avatarUrl?: string;

  @Column(DataType.TEXT)
  declare bio?: string;

  @Default(UserRole.USER)
  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
  })
  declare role: UserRole;

  @Default(UserStatus.ACTIVE)
  @Column({
    type: DataType.ENUM(...Object.values(UserStatus)),
  })
  declare status: UserStatus;

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

  /**
   * 验证密码
   */
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  /**
   * 哈希密码（创建前）
   */
  @BeforeCreate
  static async hashPasswordBeforeCreate(instance: User): Promise<void> {
    if (instance.passwordHash) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
      instance.passwordHash = await bcrypt.hash(instance.passwordHash, saltRounds);
    }
  }

  /**
   * 更新密码时重新哈希（更新前）
   */
  @BeforeUpdate
  static async hashPasswordBeforeUpdate(instance: User): Promise<void> {
    if (instance.changed('passwordHash') && instance.passwordHash) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
      instance.passwordHash = await bcrypt.hash(instance.passwordHash, saltRounds);
    }
  }

  /**
   * 转换为JSON时排除敏感字段
   */
  toJSON(): Record<string, unknown> {
    const values = Object.assign({}, this.get());
    delete values.passwordHash;
    return values;
  }

  /**
   * 获取用户简略信息（用于公开显示）
   */
  getPublicProfile(): Record<string, unknown> {
    return {
      id: this.id,
      username: this.username,
      displayName: this.displayName,
      avatarUrl: this.avatarUrl,
      bio: this.bio,
      role: this.role,
      createdAt: this.createdAt,
    };
  }

  /**
   * 检查用户是否有权限
   */
  hasPermission(requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.GUEST]: 0,
      [UserRole.USER]: 1,
      [UserRole.EDITOR]: 2,
      [UserRole.ADMIN]: 3,
    };
    
    return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
  }

  /**
   * 检查用户是否活跃
   */
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}