import React from "react";
import { graphql } from "react-apollo";
import { GET_CURRENT_WRESTLERS_ELOS } from "./queries/queries";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "react-table/react-table.css";
import Select from "react-select";
import "react-select/dist/react-select.css";
import moment from "moment";
import { floatStringSort, dateStringSort } from "./utils/table-sort";

class CurrentWrestlerEloTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedBrand: [
        { value: "RAW", label: "RAW" },
        { value: "SmackDown", label: "SmackDown" },
        { value: "NXT", label: "NXT" },
        { value: "Free Agent", label: "Free Agent" }
      ],
      nameToMatch: ""
    };

    this.handleBrandChange = selectedBrand => {
      this.setState({
        selectedBrand
      });
    };

    this.handleNameChange = event => {
      this.setState({
        nameToMatch: event.target.value
      });
    };
  }

  render() {
    const { selectedBrand, nameToMatch } = this.state;
    const eloPrecision = 1;
    const dateFormat = "Do MMM YYYY";

    const data = this.props.getCurrentWrestlersElos.loading
      ? []
      : this.props.getCurrentWrestlersElos.currentWrestlerStats
          .currentWrestlerStat;

    const filteredData = data.filter(
      wrestler =>
        selectedBrand.length > 0 &&
        selectedBrand.some(o => o.value == wrestler.brand) &&
        wrestler.name.toLowerCase().includes(nameToMatch.toLowerCase())
    );

    const columns = [
      {
        Header: "Name",
        accessor: "name"
      },
      {
        Header: "Brand",
        accessor: "brand"
      },
      {
        Header: "Current Elo",
        columns: [
          {
            Header: "Value",
            id: "currentEloValue",
            accessor: d => d.currentElo.elo.toFixed(eloPrecision),
            sortMethod: floatStringSort
          },
          {
            Header: "Date",
            id: "currentEloDate",
            accessor: d => moment(d.currentElo.date).format(dateFormat),
            sortMethod: dateStringSort
          }
        ]
      },
      {
        Header: "Maximum Elo",
        columns: [
          {
            Header: "Value",
            id: "maxEloValue",
            accessor: d => d.maxElo.elo.toFixed(eloPrecision),
            sortMethod: floatStringSort
          },
          {
            Header: "Date",
            id: "maxEloDate",
            accessor: d => moment(d.maxElo.date).format(dateFormat),
            sortMethod: dateStringSort
          }
        ]
      },
      {
        Header: "Minimum Elo",
        columns: [
          {
            Header: "Value",
            id: "minEloValue",
            accessor: d => d.minElo.elo.toFixed(eloPrecision),
            sortMethod: floatStringSort
          },
          {
            Header: "Date",
            id: "minEloDate",
            accessor: d => moment(d.minElo.date).format(dateFormat),
            sortMethod: dateStringSort
          }
        ]
      }
    ];

    const defaultSort = [{ id: "currentEloValue", desc: true }];

    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "space-around"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <span style={{ marginRight: "10px" }}>Name: </span>
            <input
              type="text"
              value={this.state.value}
              onChange={this.handleNameChange}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <span style={{ marginRight: "10px" }}>Brand: </span>
            <Select
              name="form-field-name"
              value={selectedBrand}
              onChange={this.handleBrandChange}
              options={[
                { value: "RAW", label: "RAW" },
                { value: "SmackDown", label: "SmackDown" },
                { value: "NXT", label: "NXT" },
                { value: "Free Agent", label: "Free Agent" }
              ]}
              multi
              removeSelected={false}
              style={{ minWidth: "400px" }}
            />
          </div>
        </div>

        <ReactTable
          data={filteredData}
          noDataText={
            this.props.getCurrentWrestlersElos.loading
              ? "Loading..."
              : "No data found"
          }
          columns={columns}
          defaultSorted={defaultSort}
        />
      </div>
    );
  }
}

CurrentWrestlerEloTable.propTypes = {
  getCurrentWrestlersElos: PropTypes.object // Define better in future
};

export default graphql(GET_CURRENT_WRESTLERS_ELOS, {
  name: "getCurrentWrestlersElos"
})(CurrentWrestlerEloTable);
