import { Table as AntdTable, type TableProps } from "antd";

const DEFAULT_SCROLL = { x: "max-content" } as const;

const LOCALE = { emptyText: "Нет результатов" };

type CommonTableProps<RecordType> = Omit<
  TableProps<RecordType>,
  "size" | "pagination"
>;

function CommonTable<RecordType extends object>({
  scroll = DEFAULT_SCROLL,
  ...props
}: CommonTableProps<RecordType>) {
  return (
    <AntdTable<RecordType>
      locale={LOCALE}
      size="small"
      pagination={false}
      scroll={scroll}
      {...props}
    />
  );
}

export { CommonTable };
