import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { BigNumber, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import axios from "axios";
import erc20abi from "./abi.js";

const App = () => {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState("");
  const [token, setToken] = useState("");
  const [fromToken, setfromToken] = useState("");
  const [toToken, settoToken] = useState("");
  const [amount, setAmount] = useState("");
  const [swapPrice, setSwapPrice] = useState("");
  const [price, setPrice] = useState("");
  const [contract, setContract] = useState("");

  const connectWallet = async () => {
    const _provider = new ethers.providers.Web3Provider(window.ethereum);
    if (_provider) {
      await _provider.send("eth_requestAccounts", []);
      const signer = _provider.getSigner();
      const account = await signer.getAddress();
      setAccount(account);
      setProvider(_provider);
    }
  };
  useEffect(() => {
    const getData = async () => {
      const response = await axios.get(
        "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json"
      );
      setToken(response.data.tokens);
    };
    provider && getData();
  }, [provider]);
  const handlechange1 = (event) => {
    setfromToken(event.target.value);
  };

  const handlechange2 = (event) => {
    settoToken(event.target.value);
  };

  useEffect(() => {
    const fromPrice = async () => {
      if (!fromToken || !toToken || !amount) return;
      let amt = amount * 10 ** fromToken.decimals;
      const response = await axios.get(
        `https://api.0x.org/swap/v1/price?sellToken=${fromToken.address}&buyToken=${toToken.address}&sellAmount=${amt}`
      );
      console.log(response);
      if (response) {
        setSwapPrice(response.data);
        const _price = response.data.buyAmount / 10 ** toToken.decimals;
        setPrice(_price);
      }
    };
    amount && fromPrice();
  }, [fromToken, toToken, amount]);

  console.log(fromToken, toToken, swapPrice)

  const swapToken = async () => {
    /*  const ZERO_EX_ADDRESS = "0xdef1c0ded9bec7f1a1670819833240f027b25eff"; */
    const contract = new ethers.Contract(fromToken.address, erc20abi, provider);
    const _signer = provider.getSigner();
    const contractInsatance = contract.connect(_signer);
    const maxApproval = ethers.utils.parseUnits("2", 256);
    await contractInsatance.approve(swapPrice.allowanceTarget, maxApproval, {
      from: account,
    });

    /*  const currentAllowance = new BigNumber(
      contractInsatance.allowance(account, ZERO_EX_ADDRESS)
    );
    if (currentAllowance.isLessThan(fromToken.sellAmount)) {
      await contractInsatance.approve(ZERO_EX_ADDRESS, fromToken.sellAmount, {
        from: account,
      });
    } */

    const receipt = await _signer.sendTransaction(swapPrice);
    await receipt.wait();
  };
  return (
    <Box>
      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          color: "white",
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: ".1rem",
        }}
      >
        DEX AGGREGATOR DAPP
      </Typography>
      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          sx={{ margin: "10px auto" }}
          onClick={() => connectWallet()}
        >
          {account ? account : "CONNECT TO METAMASK"}
        </Button>
      </Box>
      <Paper
        sx={{
          margin: "100px auto",
          width: "25%",
          padding: "20px",
          borderRadius: "20px",
          backgroundColor: "#BCBBBF",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            width: "40%",
            textAlign: "center",
            color: "#272333",
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".1rem",
          }}
        >
          SWAP TOKEN
        </Typography>
        <Stack gap={2} sx={{ padding: "20px" }}>
          <Paper elevation={5} sx={{ borderRadius: "20px", padding: "10px" }}>
            <Stack direction="row" sx={{ gap: "10px", alignItems: "center" }}>
              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="demo-multiple-name-label">
                  Select Token
                </InputLabel>
                <Select
                  label="Select Token"
                  value={fromToken}
                  onChange={handlechange1}
                  sx={{ "& fieldset": { border: "none" } }}
                >
                  {token &&
                    token.map((name, i) => (
                      <MenuItem key={i} value={name}>
                        <Stack
                          direction="row"
                          gap={2}
                          sx={{ alignItems: "center" }}
                        >
                          <img
                            src={name.logoURI}
                            alt="logo"
                            className="token"
                          />
                          <Typography>{name.symbol}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <TextField
                required
                InputLabelProps={{
                  shrink: true,
                }}
                label="Enter the Amount"
                onChange={(e) => setAmount(e.target.value)}
                sx={{
                  width: "100%",
                  "& fieldset": { border: "none" },
                }}
              />
            </Stack>
          </Paper>
          <Paper elevation={5} sx={{ borderRadius: "20px", padding: "10px" }}>
            <Stack direction="row" sx={{ gap: "10px", alignItems: "center" }}>
              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="demo-multiple-name-label">
                  Select Token
                </InputLabel>
                <Select
                  label="Select Token"
                  value={toToken}
                  onChange={handlechange2}
                  sx={{ "& fieldset": { border: "none" } }}
                >
                  {token &&
                    token.map((name, i) => (
                      <MenuItem key={i} value={name}>
                        <Stack
                          direction="row"
                          gap={2}
                          sx={{ alignItems: "center" }}
                        >
                          <img
                            src={name.logoURI}
                            alt="logo"
                            className="token"
                          />
                          <Typography>{name.symbol}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <TextField
                required
                label="Enter the Amount"
                sx={{
                  width: "100%",
                  "& fieldset": { border: "none" },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                value={price ? price : ""}
              />
            </Stack>
          </Paper>
          <Typography
            variant="subtitle2"
            sx={{
              margin: "auto",
              color: "#646F76",
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".1rem",
              width: "95%",
            }}
          >
            {swapPrice
              ? "Estimated Gas:" + swapPrice.estimatedGas
              : "Estimated Gas:"}
          </Typography>

          <Button variant="contained" onClick={() => swapToken()}>
            SWAP
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default App;
