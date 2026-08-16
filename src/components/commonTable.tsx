import { Table as AntdTable, type TableProps } from "antd";

const SCROLL = { x: "max-content" } as const;

const LOCALE = { emptyText: "Нет результатов" };

type CommonTableProps<RecordType> = Omit<
  TableProps<RecordType>,
  "size" | "pagination" | "scroll"
>;

function CommonTable<RecordType extends object>(props: CommonTableProps<RecordType>) {
  return (
    <AntdTable<RecordType>
      locale={LOCALE}
      size="small"
      pagination={false}
      scroll={SCROLL}
      {...props}
    />
  );
}

export { CommonTable };
