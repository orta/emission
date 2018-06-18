import { storiesOf } from "@storybook/react-native"
import React from "react"
import { graphql, QueryRenderer } from "react-relay"

import { BidFlowRenderer } from "lib/relay/QueryRenderers"
import renderWithLoadProgress from "lib/utils/renderWithLoadProgress"
import createEnvironment from "../../../relay/createEnvironment"

import { NavigatorIOS } from "react-native"
import BidFlow from "../../../Containers/BidFlow"
import { BillingAddress } from "../Screens/BillingAddress"
import { ConfirmBid } from "../Screens/ConfirmBid"
import { Registration } from "../Screens/Registration"
import { MaxBidScreen } from "../Screens/SelectMaxBid"

const testSaleArtworkID = "5ae73b417622dd026f0fe473"
const testArtworkID = "ran-hwang-ephemeral-blossom-pp"
const testSaleID = "cityarts-benefit-auction-2018"

const selectMaxBidQuery = graphql`
  query BidFlowSelectMaxBidRendererQuery($saleArtworkID: String!) {
    sale_artwork(id: $saleArtworkID) {
      ...SelectMaxBid_sale_artwork
    }
  }
`

const BidFlowStoryRenderer: React.SFC<any> = ({ render, query, saleArtworkID }) => {
  return <QueryRenderer environment={createEnvironment()} query={query} variables={{ saleArtworkID }} render={render} />
}

storiesOf("Bidding")
  .add("Show bid flow", () => {
    return (
      <BidFlowRenderer
        render={renderWithLoadProgress(BidFlow)}
        artworkID={testArtworkID}
        saleID={testSaleID}
        intent="bid"
      />
    )
  })
  .add("Select Max Bid", () => (
    <BidFlowStoryRenderer
      render={renderWithLoadProgress(MaxBidScreen)}
      query={selectMaxBidQuery}
      saleArtworkID={testSaleArtworkID}
      intent="bid"
    />
  ))
  .add("Confirm Bid", () => {
    return (
      <ConfirmBid
        sale_artwork={{
          sale: {
            id: "1",
            live_start_at: "2018-06-11T01:00:00+00:00",
            end_at: null,
          },
          artwork: {
            id: "1",
            title: "Morgan Hill (Prototype)",
            date: "1973",
            artist_names: "Lewis balts",
          },
          lot_label: "1",
        }}
        me={{
          has_qualified_credit_cards: false,
        }}
        bid={{ display: "$45,000", cents: 4500000 }}
      />
    )
  })
  .add("Confirm Bid (first time)", () => {
    return (
      <NavigatorIOS
        navigationBarHidden={true}
        initialRoute={{
          component: ConfirmBid,
          title: "",
          passProps: {
            sale_artwork: {
              sale: {
                id: "1",
                live_start_at: "2018-06-11T01:00:00+00:00",
                end_at: null,
              },
              artwork: {
                id: "1",
                title: "Morgan Hill (Prototype)",
                date: "1973",
                artist_names: "Lewis balts",
              },
              lot_label: "1",
            },
            me: {
              has_qualified_credit_cards: false,
            },
            bid: { display: "$45,000", cents: 4500000 },
          },
        }}
        style={{ flex: 1 }}
      />
    )
  })
  .add("Billing Address", () => {
    return <BillingAddress />
  })
  .add("Registration (no qualified cc on file), live sale starting in future", () => {
    return (
      <NavigatorIOS
        navigationBarHidden={true}
        initialRoute={{
          component: Registration,
          title: "",
          passProps: {
            sale: {
              id: "1",
              live_start_at: "2029-06-11T01:00:00+00:00",
              end_at: null,
              name: "Phillips New Now",
              start_at: "2018-06-11T01:00:00+00:00",
            },
          },
        }}
        style={{ flex: 1 }}
      />
    )
  })
