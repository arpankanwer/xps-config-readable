import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import "../styles/SearchConfig.css";

const SearchConfig = () => {
  const [query, setQuery] = useState("");
  const [configs, setConfigs] = useState([]);
  const [xpsDataset, setXpsDataset] = useState([]);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const [noData, setNoData] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const xpsDatasetResponse = await fetch("/json/570XPS_dataset_final.json");
      const xpsDatasetData = await xpsDatasetResponse.json();
      setXpsDataset(xpsDatasetData);

      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const xpsConfigData = JSON.parse(event.target.result);
          const configList = [];

          xpsConfigData["config"].forEach((config) => {
            config["params"].forEach((param) => {
              configList.push({
                var: param["var"],
                idx: param["idx"],
                val: param["val"],
                attr: param["attr"],
              });
            });
          });

          setConfigs(configList);
        };
        reader.readAsText(file);
      }
    };

    fetchData();
  }, [file]);

  useEffect(() => {
    if (configs.length > 0) {
      handleSearch();
    }
  }, [configs]);

  const formatIdx = (idx) => {
    if (Array.isArray(idx)) {
      return `[${idx.join(", ")}]`;
    }
    return `[${idx}]`;
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatParamValue = (dataset, configData) => {
    return typeof dataset["value"] === "string"
      ? configData["val"]
      : capitalizeFirstLetter(
          dataset["value"][configData["val"]] + " (" + configData["val"] + ")"
        );
  };

  const processConfigData = (configData, dataset) => {
    if (configData["var"] === dataset["variable_id"]) {
      const paramValue = formatParamValue(dataset, configData);
      const idxDisplay = formatIdx(configData["idx"]);

      return {
        var: configData["var"],
        name: dataset["name"],
        idx: idxDisplay,
        value: paramValue,
        attr: configData["attr"],
      };
    }
    return null;
  };

  const handleSearch = () => {
    let z = 0;
    const filteredResults = [];

    configs.forEach((configData) => {
      xpsDataset.forEach((dataset) => {
        let result = null;
        if (query === "") {
          result = processConfigData(configData, dataset);
        } else if (!isNaN(query)) {
          if (parseInt(query) === configData["var"]) {
            result = processConfigData(configData, dataset);
          }
        } else {
          if (dataset["name"].toLowerCase().includes(query.toLowerCase())) {
            result = processConfigData(configData, dataset);
          }
        }

        if (result) {
          z++;
          filteredResults.push(result);
        }
      });
    });

    setResults(filteredResults);
    setNoData(z === 0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      if (event.target.files[0].type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const xpsConfigData = JSON.parse(e.target.result);

            if (!xpsConfigData.config) {
              alert("Invalid JSON format. Missing 'config' parameter.");
            } else {
              setFile(event.target.files[0]);
            }
          } catch (error) {
            alert(
              "Failed to parse JSON. Please ensure the file is valid JSON."
            );
          }
        };
        reader.readAsText(event.target.files[0]);
      } else {
        alert("File type not supported (JSON file required)");
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="container">
      <h3 className="header">XPS Config Search</h3>
      <div className="search-container">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter variable ID or name (Click search for all)"
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
        <label htmlFor="upload-file" className="upload-button">
          Upload Config
          <input
            accept=".json"
            id="upload-file"
            type="file"
            className="upload-file-input"
            onChange={handleFileChange}
          />
        </label>
      </div>
      {file && (
        <p className="uploaded-file">
          Uploaded File: {file.name} <b>(Records: {results.length})</b>
        </p>
      )}
      <div className="div-table">
        <Paper className="paper-table-container">
          {noData ? (
            <div className="no-data">
              <h2>No Data Found</h2>
            </div>
          ) : (
            <TableContainer className="table-container">
              <Table
                stickyHeader
                aria-label="sticky table"
                sx={{
                  "& .MuiTableCell-sizeMedium": {
                    padding: "12px 16px",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell className="table-cell">No.</TableCell>
                    <TableCell className="table-cell">Var</TableCell>
                    <TableCell className="table-cell">Name</TableCell>
                    <TableCell className="table-cell">Idx</TableCell>
                    <TableCell className="table-cell">Value</TableCell>
                    <TableCell className="table-cell">Attr</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className="table-body">
                  {results
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((result, index) => (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        <TableCell className="table-cell">
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="table-cell">
                          {result.var}
                        </TableCell>
                        <TableCell className="table-cell">
                          {result.name}
                        </TableCell>
                        <TableCell className="table-cell">
                          {result.idx}
                        </TableCell>
                        <TableCell className="table-cell">
                          {result.value}
                        </TableCell>
                        <TableCell className="table-cell">
                          {result.attr}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </div>
      <div className="footer-class">
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={results.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </div>
  );
};

export default SearchConfig;
