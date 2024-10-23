import { useContext } from "react";
import { DataSetContext } from "../contexts/DataSet";

export function useDataSet(dataSetId: string) {
  return useContext(DataSetContext).get(dataSetId);
}
