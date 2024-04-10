// SPDX-License-Identifier: GPL-3.0-or-later
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity 0.7.1;

import "@balancer-labs/v2-interfaces/contracts/pool-utils/IRateProvider.sol";
import "../interfaces/stCelo/IManager.sol";

/**
 * @title Wrapped stCelo Rate Provider
 * @notice Returns the value of stCelo in terms of Celo staked
 */
contract StCeloRateProvider is IRateProvider {
    IManager public immutable stCeloManager;

    constructor(IManager _stCeloManager) {
        stCeloManager = _stCeloManager;
    }

    /**
     * @return the value of wstETH in terms of stETH
     */
    function getRate() external view override returns (uint256) {
        return stCeloManager.toCelo(1 ether);
    }
}