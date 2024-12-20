import React, { useEffect, useState } from 'react';
import { SiSnowflake } from "react-icons/si";
import PulseLoader from "react-spinners/PulseLoader";

const SnowflakeConnectForm = () => {
  const [username, setUsername] = useState('Ankush18');
  const [password, setPassword] = useState('123asdQWE');
  const [account, setAccount] = useState('vl95947.ap-southeast-1');
  const [warehouse, setWarehouse] = useState('COMPUTE_WH');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [databases, setDatabases] = useState([]);
  const [schemas, setSchemas] = useState([]); // State for schemas
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [selectedSchema, setSelectedSchema] = useState(''); // State for selected schema
  const [selectedTable1, setSelectedTable] = useState('');
  const [loading, setLoading] = useState(false); // State to manage loader visibility
  const [schemaLoading, setSchemaLoading] = useState(false); // State for table loading animation

  useEffect(() => {
    if (selectedTable1) {
      localStorage.setItem('selectedTable1', selectedTable1);
    }
    if (selectedDatabase) {
      localStorage.setItem('selectedDatabase', selectedDatabase);
    }
    if (selectedSchema) {
      localStorage.setItem('selectedSchema', selectedSchema);
    }

    if (username) {
      localStorage.setItem('sfUsername', username);
    }
    if (password) {
      localStorage.setItem('sfPassword', password);
    }
    if (account) {
      localStorage.setItem('sfAccount', account);
    }
    if (warehouse) {
      localStorage.setItem('sfWarehouse', warehouse);
    }
  }, [selectedDatabase, selectedSchema, selectedTable1])


  // Handle Snowflake login and fetch databases
  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/snowflake-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, account, warehouse }),
      });

      const data = await response.json();
      // alert(data.message || "Login Failed");

      if (response.ok) {
        setConnectionStatus('Connected');
        setDatabases(data.databases || []);
      } else {
        setConnectionStatus('Not Connected');
      }
    } catch (error) {
      setConnectionStatus('Not Connected');
      console.error('Error connecting to Snowflake:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch schemas for the selected database
  const fetchSchemas = async (database) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/snowflake-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, account, warehouse, selected_database: database }),
      });

      const data = await response.json();
      if (response.ok) {
        setSchemas(data.schemas || []);
      } else {
        console.error('Error fetching schemas:', data.message);
      }
    } catch (error) {
      console.error('Error fetching schemas:', error);
    } finally {
      setSchemaLoading(false); // Hide loader
    }
  };

  // Handle database selection
  const handleDatabaseChange = (e) => {
    const database = e.target.value;
    setSelectedDatabase(database);
    setSchemas([]); // Reset schemas
    setSelectedSchema(''); // Reset selected schema
    setSchemaLoading(true);
    if (database) {
      fetchSchemas(database); // Fetch schemas for the selected database
    }
  };

  return (
    <div className="container">
      <div className='Sameline'>
        <h2><img src='/snow_logo.png' style={{ height: '30px', width: '30px' }}></img></h2>
        <h2>Connect To SNOWFLAKE</h2>
      </div>

      <div>
        <label className="Username">Username</label>
        <input
          className="UsernameInput"
          placeholder="Enter your Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label className="Password">Password</label>
        <input
          className="PasswordInput"
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="Account">Account</label>
        <input
          className="AccountInput"
          placeholder="Enter your account"
          type="text"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
      </div>
      <div>
        <label className="Warehouse">Warehouse</label>
        <input
          className="warehouseinput"
          placeholder="Enter your Warehouse"
          type="text"
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
        />
      </div>
      <button className="Connectbtn" onClick={handleConnect}>
        Connect to SNOWFLAKE
      </button>

      {/* Loader for connection */}
      {loading && (
        <div className="loader-container">
          <PulseLoader color="#2e18c3" />
        </div>
      )}

      <div className="ConnectionStatus">
        <span id="connection-status" className="ConnectionStatus1 text-primary fs-5">
          Connection Status:
        </span>
        {connectionStatus === 'Connected' ? (
          <p className="Connected text-green">Connected</p>
        ) : (
          <p className="notConnected text-red">Not Connected</p>
        )}
      </div>

      {connectionStatus === 'Connected' && databases.length > 0 && (
        <div className="DatabaseSelection">
          <label htmlFor="database-select">Choose a Database:</label>
          <select
            id="database-select"
            value={selectedDatabase}
            onChange={handleDatabaseChange}
          >
            <option value="">--Select a Database--</option>
            {databases.map((db, index) => (
              <option key={index} value={db}>
                {db}
              </option>
            ))}
          </select>
        </div>
      )}


      {/* Loader for fetching tables */}
      {schemaLoading && (
        <div className="loader-container ">
          <PulseLoader color="#2e18c3" />
        </div>
      )}


      {schemas.length > 0 && (
        <div className="SchemaSelection">
          <label htmlFor="schema-select">Choose a Schema:</label>
          <select
            id="schema-select"
            value={selectedSchema}
            onChange={(e) => setSelectedSchema(e.target.value)}
          >
            <option value="">--Select a Schema--</option>
            {schemas.map((schema, index) => (
              <option key={index} value={schema}>
                {schema}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display selected schmema */}
      {selectedSchema && (
        <div className="SelectedSchema">
          <h3 className="SelectedSchema">Selected Schema: {selectedSchema}</h3>
        </div>
      )}
      {schemas.length > 0 && (
        <div className="TargetTable">
          <label htmlFor="schema-select">Target Table Name:</label>
          <input
            type="text"
            id="targetTableName"
            value={selectedTable1}
            onChange={(e) => setSelectedTable(e.target.value)}
          />
        </div>
      )}

    </div>

  );
};

export default SnowflakeConnectForm;