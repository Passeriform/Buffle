import { Block, BlockValue } from "./gui/block"
import { Animation, Tween } from "./animation"
import { mergeRGBChannels, parseColorHex, splitRGBChannels, toColorHex } from "./utility/color"
import type { Layout } from "./utility/layout"

type BlockMoveMetadata = { targetIndex: number }

type BlockMoveDeferArgs = { from: Layout, to: Layout }

// TODO: Add cleanup method for removing overrides when animation is completed. Resize is breaking layout post-animation
export class BlockMoveAnimation extends Animation<Block, BlockMoveDeferArgs> {
    public metadata: BlockMoveMetadata

    constructor(widget: Block, tween: Tween, metadata: BlockMoveMetadata) {
        super(widget, tween)
        this.metadata = metadata
    }

    override next(delta: number, { from, to }: BlockMoveDeferArgs) {
        const { left, top } = this.interpolate(from, to, delta)

        this.widget.layoutOverride = { ...from, left, top }
    }
}

export class BlockMergeAnimation extends BlockMoveAnimation {
    override next(delta: number, { from, to }: BlockMoveDeferArgs) {
        super.next(delta, { from, to })

        const { opacity } = this.interpolate({ opacity: 1 }, { opacity: 0 }, delta)

        this.widget.optionsOverride.opacity = opacity
    }
}

export class BlockUpgradeAnimation extends Animation<Block> {
    override next(delta: number) {
        const beforeColor = parseColorHex(Block.COLOR_MAPPING[this.widget.index])
        const afterColor = parseColorHex(Block.COLOR_MAPPING[BlockValue.next(this.widget.index)])
        const [rb, gb, bb] = splitRGBChannels(beforeColor)
        const [ra, ga, ba] = splitRGBChannels(afterColor)
        const { red, green, blue } = this.interpolate(
            { red: rb, green: gb, blue: bb },
            { red: ra, green: ga, blue: ba },
            delta
        )
        const color = mergeRGBChannels(red, green, blue)

        this.widget.optionsOverride.background = toColorHex(color)
    }
}

export class BlockSpawnAnimation extends Animation<Block> {
    override next(delta: number) {
        const { opacity } = this.interpolate({ opacity: 0 }, { opacity: 1 }, delta)

        this.widget.optionsOverride.opacity = opacity
    }
}
