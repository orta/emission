import React from "react"
import { NavigatorIOS, ViewProperties } from "react-native"
import { createRefetchContainer, graphql, RelayRefetchProp } from "react-relay"

import { Schema, screenTrack } from "../../../utils/track"

import { Flex } from "../Elements/Flex"

import { BiddingThemeProvider } from "../Components/BiddingThemeProvider"
import Spinner from "../../../Components/Spinner"
import { Button } from "../Components/Button"
import { Container } from "../Components/Containers"
import { MaxBidPicker } from "../Components/MaxBidPicker"
import { Title } from "../Components/Title"
import { ConfirmBidScreen } from "./ConfirmBid"

import { SelectMaxBid_sale_artwork } from "__generated__/SelectMaxBid_sale_artwork.graphql"
import { SelectMaxBid_me } from "__generated__/SelectMaxBid_me.graphql"

interface SelectMaxBidProps extends ViewProperties {
  sale_artwork: SelectMaxBid_sale_artwork
  me: SelectMaxBid_me
  navigator: NavigatorIOS
  relay: RelayRefetchProp
}

interface SelectMaxBidState {
  selectedBidIndex: number
  isRefreshingSaleArtwork: boolean
}

@screenTrack({
  context_screen: Schema.PageNames.BidFlowMaxBidPage,
  context_screen_owner_type: null,
})
export class SelectMaxBid extends React.Component<SelectMaxBidProps, SelectMaxBidState> {
  state = {
    selectedBidIndex: 0,
    isRefreshingSaleArtwork: false,
  }

  refreshSaleArtwork = () => {
    this.setState({ isRefreshingSaleArtwork: true })
    this.props.relay.refetch(
      { saleArtworkID: this.props.sale_artwork._id },
      null,
      () => {
        this.setState({ isRefreshingSaleArtwork: false })
      },
      { force: true }
    )
  }

  onPressNext = () => {
    this.props.navigator.push({
      component: ConfirmBidScreen,
      title: "",
      passProps: {
        ...this.props,
        bid: this.props.sale_artwork.increments[this.state.selectedBidIndex],
        refreshSaleArtwork: this.refreshSaleArtwork,
      },
    })
  }

  render() {
    const bids =
      (this.props.sale_artwork &&
        this.props.sale_artwork.increments &&
        this.props.sale_artwork.increments.map(i => ({ label: i.display, value: i.cents }))) ||
      []

    return (
      <BiddingThemeProvider>
        <Container m={0}>
          <Title>Your max bid</Title>

          {this.state.isRefreshingSaleArtwork ? (
            <Spinner />
          ) : (
            <MaxBidPicker
              bids={bids}
              onValueChange={(_, index) => this.setState({ selectedBidIndex: index })}
              selectedValue={this.state.selectedBidIndex}
            />
          )}

          <Flex m={4}>
            <Button text="NEXT" onPress={this.onPressNext} />
          </Flex>
        </Container>
      </BiddingThemeProvider>
    )
  }
}

export const MaxBidScreen = createRefetchContainer(
  SelectMaxBid,
  {
    sale_artwork: graphql`
      fragment SelectMaxBid_sale_artwork on SaleArtwork {
        increments {
          display
          cents
        }
        _id
        ...ConfirmBid_sale_artwork
      }
    `,
    me: graphql`
      fragment SelectMaxBid_me on Me {
        ...ConfirmBid_me
      }
    `,
  },
  graphql`
    query SelectMaxBidRefetchQuery($saleArtworkID: String!) {
      sale_artwork(id: $saleArtworkID) {
        ...SelectMaxBid_sale_artwork
      }
    }
  `
)
