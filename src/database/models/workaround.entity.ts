import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Workaround extends Model<Workaround> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  })
  workaroundId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  issueId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  actionName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  jobTemplateId: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  jobTemplateName: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  inventory: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  module_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  module_args: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  limit: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  credential: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  privilegeEscalation: boolean;

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: true,
  })
  parameters: Array<number>;
}
