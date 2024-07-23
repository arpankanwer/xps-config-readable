import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  overflow: "hidden",
  padding: theme.spacing(2),
  textAlign: "center",
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 440,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: "300px",
  margin: theme.spacing(1),
  borderRadius: "25px", // Rounded corners
  "& .MuiOutlinedInput-root": {
    borderRadius: "25px", // Rounded corners for the input field
  },
}));

const RecordCount = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(1),
  textAlign: "left",
}));

const SearchConfig = () => {
  const [query, setQuery] = useState("");
  const [configs, setConfigs] = useState([]);
  const [xpsDataset, setXpsDataset] = useState([]);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const xpsDatasetResponse = await fetch("/570XPS_dataset_final.json");
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

  const formatIdx = (idx) => {
    if (Array.isArray(idx)) {
      return `[${idx.join(", ")}]`;
    }
    return `[${idx}]`;
  };

  const handleSearch = () => {
    let z = 0;
    const filteredResults = [];

    if (query === "") {
      configs.forEach((configData) => {
        xpsDataset.forEach((dataset) => {
          if (configData["var"] === dataset["variable_id"]) {
            z++;
            const paramValue =
              typeof dataset["value"] === "string"
                ? dataset["value"]
                : dataset["value"][configData["val"]] +
                  " (" +
                  configData["val"] +
                  ")";
            const idxDisplay = formatIdx(configData["idx"]);

            filteredResults.push({
              var: configData["var"],
              name: dataset["name"],
              idx: idxDisplay,
              value: paramValue,
              attr: configData["attr"],
            });
          }
        });
      });
    } else if (!isNaN(query)) {
      configs.forEach((configData) => {
        xpsDataset.forEach((dataset) => {
          if (
            parseInt(query) === configData["var"] &&
            configData["var"] === dataset["variable_id"]
          ) {
            z++;
            const paramValue =
              typeof dataset["value"] === "string"
                ? dataset["value"]
                : dataset["value"][configData["val"]] +
                  " (" +
                  configData["val"] +
                  ")";
            const idxDisplay = formatIdx(configData["idx"]);

            filteredResults.push({
              var: configData["var"],
              name: dataset["name"],
              idx: idxDisplay,
              value: paramValue,
              attr: configData["attr"],
            });
          }
        });
      });
    } else {
      configs.forEach((configData) => {
        xpsDataset.forEach((dataset) => {
          if (
            dataset["name"].toLowerCase().includes(query.toLowerCase()) &&
            configData["var"] === dataset["variable_id"]
          ) {
            z++;
            const paramValue =
              typeof dataset["value"] === "string"
                ? dataset["value"]
                : dataset["value"][configData["val"]] +
                  " (" +
                  configData["val"] +
                  ")";
            const idxDisplay = formatIdx(configData["idx"]);

            filteredResults.push({
              var: configData["var"],
              name: dataset["name"],
              idx: idxDisplay,
              value: paramValue,
              attr: configData["attr"],
            });
          }
        });
      });
    }

    setResults(filteredResults);
    if (z === 0) {
      console.log("NO DATA FOUND");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <StyledPaper>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography variant="h5" gutterBottom>
          XPS Config Search
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
          <StyledTextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter variable ID or name"
            variant="outlined"
          />
          <StyledButton
            variant="contained"
            color="primary"
            onClick={handleSearch}
          >
            Search
          </StyledButton>
          <input
            accept=".json"
            id="upload-file"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <label htmlFor="upload-file">
            <StyledButton
              variant="contained"
              color="secondary"
              component="span"
            >
              Upload Config
            </StyledButton>
          </label>
        </Box>
        {file && (
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Uploaded File: {file.name}
          </Typography>
        )}
        <StyledTableContainer>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <RecordCount variant="subtitle1" color="textSecondary">
              Records: {results.length}
            </RecordCount>
          </Box>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell> {/* Row number column */}
                <TableCell>Var</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Idx</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Attr</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((result, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>{" "}
                    {/* Row number */}
                    <TableCell>{result.var}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell>{result.idx}</TableCell>
                    <TableCell>{result.value}</TableCell>
                    <TableCell>{result.attr}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={results.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </StyledPaper>
  );
};

export default SearchConfig;
