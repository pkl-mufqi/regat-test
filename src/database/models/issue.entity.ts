import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Issue extends Model<Issue> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  issueId: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  policyId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  issueLink: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  labels: Array<string>;

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: true,
  })
  workarounds: Array<number>;
}
