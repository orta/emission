import React from "react"
import { NavigatorIOS, View } from "react-native"
import { createFragmentContainer, graphql } from "react-relay"

import SwitchBoard from "lib/NativeModules/SwitchBoard"

import { Flex } from "../Elements/Flex"
import { Icon20 } from "../Elements/Icon"

import { BiddingThemeProvider } from "../Components/BiddingThemeProvider"
import { BidGhostButton, Button } from "../Components/Button"
import { Container } from "../Components/Containers"
import { Markdown } from "../Components/Markdown"
import { Timer } from "../Components/Timer"
import { Title } from "../Components/Title"

import { BidResult_sale_artwork } from "__generated__/BidResult_sale_artwork.graphql"

const SHOW_TIMER_STATUSES = ["WINNING", "OUTBID", "RESERVE_NOT_MET"]

export interface BidderPositionResult {
  status:  // bidder position status
    | "OUTBID"
    | "PENDING"
    | "RESERVE_NOT_MET"
    | "WINNING"
    // mutation status
    | "SALE_CLOSED"
    | "LIVE_BIDDING_STARTED"
    | "BIDDER_NOT_QUALIFIED"
    // general error status for e.g. Gravity not available, no internet in the device
    | "ERROR"
    //
    | "SUCCESS"

  message_header: string
  message_description_md: string
  position?: {
    id: string
    suggested_next_bid: {
      cents: string
      display: string
    }
  }
}

interface BidResultProps {
  sale_artwork: BidResult_sale_artwork
  bidderPositionResult: BidderPositionResult
  navigator: NavigatorIOS
}

const messageForPollingTimeout = {
  title: "Bid processing",
  description: `
    We’re receiving a high volume of traffic
    and your bid is still processing.

    If you don’t receive an update soon,
    please contact [support@artsy.net](mailto:support@artsy.net).
  `
}

const Icons = {
  WINNING: require("../../../../../images/circle-check-green.png"),
  PENDING: require("../../../../../images/circle-exclamation.png"),
}

export class BidResult extends React.Component<BidResultProps> {
  onPressBidAgain = () => {
    // pushing to MaxBidScreen creates a circular relay reference but this works
    // TODO: correct the screen transision animation
    this.props.navigator.popToTop()
  }

  exitBidFlow = async () => {
    await SwitchBoard.dismissModalViewController(this)

    if (this.props.bidderPositionResult.status === "LIVE_BIDDING_STARTED") {
      SwitchBoard.presentModalViewController(this, `/auction/${this.props.sale_artwork.sale.id}`)
    }
  }

  render() {
    const { sale_artwork, bidderPositionResult } = this.props
    const { live_start_at, end_at } = sale_artwork.sale
    const { status, message_header, message_description_md, position } = bidderPositionResult

    const nextBid = ((position && position.suggested_next_bid) || sale_artwork.minimum_next_bid || ({} as any)).display

    return (
      <BiddingThemeProvider>
        <Container mt={6}>
          <View>
            <Flex alignItems="center">
              <Icon20 source={Icons[status] || require("../../../../../images/circle-x-red.png")} />

              <Title m={4}>
                {status === "PENDING" ? messageForPollingTimeout.title : (message_header || "You’re the highest bidder")}
              </Title>

              <Markdown>{status === "PENDING" ? messageForPollingTimeout.description : message_description_md || ""}</Markdown>

              {this.shouldDisplayTimer(status) && <Timer liveStartsAt={live_start_at} endsAt={end_at} />}
            </Flex>
          </View>
          {this.canBidAgain(status) ? (
            <Button text={`Bid ${nextBid} or more`} onPress={() => this.onPressBidAgain()} />
          ) : (
            <BidGhostButton text="Continue" onPress={this.exitBidFlow} />
          )}
        </Container>
      </BiddingThemeProvider>
    )
  }

  private shouldDisplayTimer(status: string) {
    return SHOW_TIMER_STATUSES.indexOf(status) > -1
  }

  private canBidAgain(status: string) {
    return status === "OUTBID" || status === "RESERVE_NOT_MET"
  }
}

export const BidResultScreen = createFragmentContainer(
  BidResult,
  graphql`
    fragment BidResult_sale_artwork on SaleArtwork {
      minimum_next_bid {
        amount
        cents
        display
      }
      sale {
        live_start_at
        end_at
        id
      }
    }
  `
)
