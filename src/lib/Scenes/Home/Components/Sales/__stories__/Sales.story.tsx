import { storiesOf } from "@storybook/react-native"
import { SaleItem } from "lib/Scenes/Home/Components/Sales/Components/SaleItem"
import React from "react"
import { Text, View } from "react-native"

storiesOf("Scenes/Home/Sales")
  .add("<SaleItem /> | Current Live", () => {
    return (
      <View>
        <SaleItem
          key={1}
          sale={{
            id: "foo",
            name: "name",
            is_open: false,
            is_live_open: false,
            start_at: null,
            end_at: null,
            registration_ends_at: null,
            live_start_at: null,
            cover_image: null,
          }}
        />
      </View>
    )
  })
  .add("<SaleItem /> | Current Timed", () => {
    return (
      <View>
        <Text>Todo</Text>
      </View>
    )
  })
  .add("Lots By Artists You Follow", () => {
    return (
      <View>
        <Text>Todo</Text>
      </View>
    )
  })
